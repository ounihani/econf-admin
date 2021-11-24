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

// Resources definitions
// const User = mongoose.model('User', {
//   email: { type: String, required: true },
//   encryptedPassword: { type: String, required: true },
//   role: { type: String, enum: ['admin', 'restricted'], required: true },
// })

// Cars collection
const Cars = mongoose.model('Car', {
  name: String,
  color: { type: String, enum: ['black'], required: true }, // Henry Ford
  ownerId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  }
})

// RBAC functions
const canEditCars = ({ currentAdmin, record }) => {
  return currentAdmin && (
    currentAdmin.role === 'admin'
    || currentAdmin._id == record.param('ownerId')
  )
}
const canListCars = ({ currentAdmin, record }) => {
  //console.log(record);
  return currentAdmin && (
    currentAdmin.role === 'admin'
    || (typeof record !== "undefined" && currentAdmin._id === record.param('ownerId'))
  )
}
const canModifyUsers = ({ currentAdmin }) => {
  return currentAdmin && currentAdmin.role === 'admin'
}

const canListUsers = ({ currentAdmin }) => {
  return currentAdmin && currentAdmin.role === 'admin'
}
const canListConferences = ({ currentAdmin }) => {
  return currentAdmin && currentAdmin.role === 'admin'
}
const canListPrograms = ({ currentAdmin }) => {
  return currentAdmin && currentAdmin.role === 'admin'
}
// Pass all configuration settings to AdminBro
const adminBro = new AdminBro({
  resources: [
    {
      resource: Cars,
      options: {
        properties: {
          ownerId: { isVisible: { edit: false, show: true, list: true, filter: true } }
        },
        actions: {
          // list: { isAccessible: canEditCars },
          edit: { isAccessible: canEditCars },
          delete: { isAccessible: canEditCars },
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
          ownerId: { isVisible: { edit: false, show: true, list: true, filter: true } }
        },
        actions: {
          list: { isAccessible: canListConferences },
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
  rootPath: '/admin',
})

// Build and use a router which will handle all AdminBro routes
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