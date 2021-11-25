// Requirements
const mongoose = require('mongoose')
const express = require('express')
const AdminBro = require('admin-bro')
const AdminBroExpressjs = require('@admin-bro/express')
const bcrypt = require('bcrypt')
require('./config/db')
let User = require('./models/user.model')
let Programs = require('./models/program.model')
let Conferences = require('./models/conferences.model')
// We have to tell AdminBro that we will manage mongoose resources with it
AdminBro.registerAdapter(require('@admin-bro/mongoose'))

// express server definition
const app = express()


// RBAC functions ( Role Based Access control )

const canModifyUsers = ({ currentAdmin }) => {
  return currentAdmin && currentAdmin.role === 'admin'
}

const canListUsers = ({ currentAdmin }) => {
  return currentAdmin && currentAdmin.role === 'admin'
}

const canListPrograms = ({ currentAdmin }) => {
  return currentAdmin && currentAdmin.role === 'admin'
}

//changin admin bro text
const locale = {
  translations: {
    labels: {
      // change Heading for Login
      loginWelcome: '',
    },
    messages: {
      loginWelcome: '',
    },
  },
};

// Pass all configuration settings to AdminBro
const adminBro = new AdminBro({
  resources: [
    {
      resource: User,
      options: {
        properties: {
          encryptedPassword: { isVisible: false },
          password: {
            type: 'string',
            isVisible: {
              list: false, edit: true, filter: false, show: false,
            },
          },
        },
        actions: {
          new: {
            before: async (request) => {
              if (request.payload.password) {
                request.payload = {
                  ...request.payload,
                  encryptedPassword: await bcrypt.hash(request.payload.password, 10),
                  password: undefined,
                }
              }
              return request
            },
          },
          edit: { isAccessible: canModifyUsers },
          delete: { isAccessible: canModifyUsers },
          new: { isAccessible: canModifyUsers },
          list: { isAccessible: canListUsers }
        }
      }
    },
    {
      resource: Conferences,
      options: {
        properties: {
          _id: { isVisible: { edit: false, show: false, list: true, filter: false } },
          ownerId: { isVisible: { edit: false, show: true, list: true, filter: true } }
        },
        actions: {
          list: {
            before: async (request, context) => {
              const { currentAdmin } = context
              if(currentAdmin.role == 'admin'){
                return {
                  ...request,
                  query: {
                     ...request.query
                  }
                }
              } else {
                return {
                  ...request,
                  query: {
                     ...request.query,
                     'filters.confadmin':  currentAdmin._id
                  }
                }
              }
            },
          },
          new: {
            before: async (request, { currentAdmin }) => {
              request.payload = {
                ...request.payload,
                ownerId: currentAdmin._id,
              }
              return request
            },
          }
        }
      }
    },
    {
      resource: Programs,
      options: {
        properties: {
          ownerId: { isVisible: { edit: false, show: true, list: true, filter: true } }
        },
        actions: {
          list: { isAccessible: canListPrograms },
          new: {
            before: async (request, { currentAdmin }) => {
              request.payload = {
                ...request.payload,
                ownerId: currentAdmin._id,
              }
              return request
            },
          }
        }
      }
    }
  ],
  locale,
  rootPath: '/admin',
  branding: {
    companyName: '',
    softwareBrothers: false,
    logo: '',
  },
})

// Build and use a router which will handle all AdminBro routes and adding athentication
const router = AdminBroExpressjs.buildAuthenticatedRouter(adminBro, {
  authenticate: async (email, password) => {
    const user = await User.findOne({ email })
    if (user) {
      const matched = await bcrypt.compare(password, user.password)
      if (matched) {
        return user
      }
    }
    return false
  },
  cookiePassword: 'some-secret-password-used-to-secure-cookie',
})

app.use(adminBro.options.rootPath, router)

// Running the server
const run = async () => {
  await app.listen(8080, () => console.log(`Example app listening on port 8080!`))
}

run()