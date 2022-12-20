import { NextFunction, Response } from 'express'
import { PayloadRequest } from 'payload/types'
import { extractToken, getTokenPayload } from '../adapters'
import { getCacheItem, setCacheItem } from '../helpers'
import { DEFAULT_USER_COLLECTION } from '../types'

function hasValidPath(url: string): boolean {
  return url.includes(`/api/`)
}

export const cacheMiddleware = async (req: PayloadRequest, res: Response, next: NextFunction) => {
  // try to match the cache and return immediately
  const {
    originalUrl,
    headers: { cookie }
  } = req

  // not a valid path of method is not a GET skip all
  if (!hasValidPath(originalUrl) || req.method !== 'GET') {
    return next()
  }

  let userCollection: string = DEFAULT_USER_COLLECTION
  // check if there is a cookie and extract data
  if (cookie) {
    const token = extractToken(cookie)
    if (token) {
      const tokenData = getTokenPayload(token)
      userCollection = tokenData.collection
    }
  }

  // TODO find a better way, mega HACK
  const json = res.json
  res.json = (body) => {
    res.json = json
    setCacheItem(userCollection, originalUrl, body)
    return res.json(body)
  }
  // mega HACK

  // Try to get the cached item
  const cacheData = await getCacheItem(userCollection, originalUrl)
  if (cacheData) {
    return res.setHeader('Content-Type', 'application/json').send(cacheData)
  }
  // route to controllers
  return next()
}