import path from 'path'
import { cachePlugin } from 'payload-redis-cache'
import { buildConfig } from 'payload/config'
import Examples from './collections/Examples'
import Users from './collections/Users'

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  admin: {
    user: Users.slug,
    webpack: (webpackConfig) => {
      console.log(webpackConfig)
      webpackConfig.module.rules.push({
        test: /\.m?js/,
        resolve: {
          fullySpecified: false
        }
      })
      return {
        ...webpackConfig,
        resolve: {
          ...(webpackConfig.resolve || {}),
          alias: {
            ...(webpackConfig.resolve.alias || {}),
            react: path.resolve(__dirname, '../node_modules/react')
          }
          // fallback: {
          //   fs: false,
          //   net: false,
          //   crypto: false,
          //   browser: false
          // }
        }
      }
    }
  },
  collections: [Users, Examples],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts')
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql')
  },
  plugins: [cachePlugin({ redisUrl: process.env.REDIS_URI })]
})
