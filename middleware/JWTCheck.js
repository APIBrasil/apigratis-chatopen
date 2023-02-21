const jwt = require('jsonwebtoken');

function JWTCheck(req, res, next) {
  // Pega o token do header da requisição
  // const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  //get all cookies headers
  const cookies = req.headers.cookie;

  //get token from cookies
  const token = cookies && cookies.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];

  console.log('token', token);

  if (!token) {
    return res.status(401).redirect('/auth');
  }
  
  try {
    // Verifica o token usando a chave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Adiciona os dados do usuário decodificados à requisição para uso nas próximas rotas
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).redirect('/auth')-send({
      message: 'Falha na autenticação do token'
    });
  }
}

module.exports = JWTCheck;