const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/admin.directory.user'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
//const TOKEN_PATH = path.join(process.cwd(), 'token.json');
//const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
//console.log(TOKEN_PATH, CREDENTIALS_PATH);
/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist(TOKEN_PATH) {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize(TOKEN_PATH,CREDENTIALS_PATH) {
  try {
    let client = await loadSavedCredentialsIfExist(TOKEN_PATH);
    if (client) {
      return client;
    }
    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
      await saveCredentials(client);
    }
    return client;
  } catch (error) {
    return error
  }  
}

/**
 * Lists the first 10 users in the domain.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listUsers(auth) {
  console.log('Listar');
  const service = google.admin({version: 'directory_v1', auth});
  const res = await service.users.list({
    customer: 'my_customer',
    maxResults: 12,
    orderBy: 'email',
  });

  const users = res.data.users;
  if (!users || users.length === 0) {
    console.log('No users found.');
    return;
  }

  console.log('Users:(',users.length,')');
  users.forEach((user) => {
    console.log(`${user.primaryEmail} (${user.name.fullName})`);
  });
  return users;
}

//authorize().then(listUsers).catch(console.error);

async function findUser(auth, userEmail) {
    const service = google.admin({ version: 'directory_v1', auth });
    try {
      const res = await service.users.get({
        userKey: userEmail,
      });
  
      const user = res.data;
      console.log('Usuario encontrado:');
      console.log(user);
      return user;
    } catch (error) {
      console.error('Error al buscar el usuario:', error.message);
    }
  }
  // Uso de la función findUser
const userEmailToFind = 'estudiante.prueba.1@egbfcristorey.edu.ec'; // Reemplaza con el correo del usuario que deseas buscar
//authorize().then((auth) => findUser(auth, userEmailToFind)).catch(console.error);

async function suspendUser(auth, userEmail,estado) {
    const service = google.admin({ version: 'directory_v1', auth });
    try {
      // Buscar el usuario
      const res = await service.users.get({
        userKey: userEmail,
      });
  
      const user = res.data;
  
      if (!user) {
        console.log('Usuario no encontrado.');
        return;
      }else if(!user.isAdmin){

        // Suspende al usuario
        const u= await service.users.update({
            userKey: userEmail,
            resource: { suspended: estado },
        });
  
      console.log('Usuario suspendido:');
      console.log(u.data.suspended);
      }
  
    } catch (error) {
      console.error('Error al suspender al usuario:', error.message);
    }
  }
  
  // Uso de la función suspendUser
  const userEmailToSuspend = 'estudiante.prueba.1@egbfcristorey.edu.ec'; // Reemplaza con el correo del usuario que deseas suspender
  //authorize().then((auth) => suspendUser(auth,userEmailToSuspend,true)).catch(console.error);

  async function suspendUserMasivo(auth, userEmails,estado) {
    const service = google.admin({ version: 'directory_v1', auth });
    try {
      let resp=[];
        // Obtén información de los usuarios a suspender
        for (const userEmail of userEmails) {
          const res = await service.users.get({
            userKey: userEmail,
          });
          const user = res.data;
          if (user&&!user.isAdmin) {
            //usersToSuspend.push({ primaryEmail: userEmail, suspended: estado });

            const u= await service.users.update({
                userKey: userEmail,
                resource: { suspended: estado },
            });
            resp.push({userEmail:userEmail,suspended:u.data.suspended});
          console.log('Usuario suspendido:');
          console.log(userEmail,u.data.suspended);
            
          } else {
            console.log(`Usuario ${userEmail} no encontrado.`);
          }
          
        }
        return resp;
      } catch (error) {
        console.error('Error al suspender usuarios:', error.message);
      }
  }
  
  // Uso de la función suspendUser
  //const usersEmailToSuspend = ['estudiante.prueba.1@egbfcristorey.edu.ec','pruebaestudiaestudiante.prueba.2@egbfcristorey.edu.ec']; // Reemplaza con el correo del usuario que deseas suspender
  //authorize().then((auth) => suspendUserMasivo(auth, usersEmailToSuspend,true)).catch(console.error);

  const cambiarEstadoGoogle = async function (req, res) {
    if (req.user) {
      let data = req.body;
      try {
        if (data.array && data.estado!=undefined) {
          const TOKEN_PATH = path.join(process.cwd(), 'controllers/'+req.user.base+'/token.json');
          const CREDENTIALS_PATH = path.join(process.cwd(), 'controllers/'+req.user.base+'/credentials.json');
          const client = await authorize(TOKEN_PATH, CREDENTIALS_PATH);
          const users = await suspendUserMasivo(client, data.array, data.estado);
  
          res.status(200).send({ users: users });
        } else {
          // Se mantiene el código de estado 200, pero deberías proporcionar un mensaje
          res.status(200).send({ message: 'Datos incompletos',array:data.array,estado:data.estado});
        }
      } catch (error) {
        // Se utiliza el código de estado 200 para indicar que hubo un error en el servidor
        res.status(500).send({ error: error });
      }
    } else {
      // Se utiliza el código de estado 403 para indicar falta de acceso
      res.status(403).send({ message: 'NoAccess' });
    }
  };

  const consultarEstadoGoogle = async function (req, res) {
    if (req.user) {
      var id = req.params['id'];
      console.log(id);
      try {
        if (id) {
          const TOKEN_PATH = path.join(process.cwd(), 'controllers/'+req.user.base+'/token.json');
          const CREDENTIALS_PATH = path.join(process.cwd(), 'controllers/'+req.user.base+'/credentials.json');
          const client = await authorize(TOKEN_PATH, CREDENTIALS_PATH);
          const users = await findUser(client, id);
  
          res.status(200).send({ users: users });
        } else {
          // Se mantiene el código de estado 200, pero deberías proporcionar un mensaje
          res.status(200).send({ message: 'Datos incompletos' });
        }
      } catch (error) {
        // Se utiliza el código de estado 200 para indicar que hubo un error en el servidor
        res.status(500).send({ error: error });
      }
    } else {
      // Se utiliza el código de estado 403 para indicar falta de acceso
      res.status(403).send({ message: 'NoAccess' });
    }
  };
  module.exports = {
    cambiarEstadoGoogle,
    consultarEstadoGoogle
  }