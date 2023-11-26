const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');

const salt = bcrypt.genSaltSync(10);
const secret = 'secretToken';

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect('mongodb://127.0.0.1:27017/newBlogDatabase')
  .then(() => console.log("Connected successfully"))
  .catch((e) => console.error("Connection error:", e));


  
  const signToken = (data) => {
    return new Promise((resolve, reject) => {
      jwt.sign(data, secret, {}, (err, token) => {
        if (err) reject(err);
        resolve(token);
      });
    });
  };
  

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, {}, (err, info) => {
      if (err) reject(err);
      resolve(info);
    });
  });
};


const renameFile = (originalname, path) => {
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path + '.' + ext;
  fs.renameSync(path, newPath);
  return newPath;
};

const authenticateUser = async (username, password) => {
  const userDoc = await User.findOne({ username });
  if (!userDoc) throw new Error('User not found');
  
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (!passOk) throw new Error('Wrong credentials');

  return userDoc;
};

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    console.error(e);
    res.status(400).json(e);
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await authenticateUser(username, password);
    const token = await signToken({ username, id: userDoc._id });
    res.cookie('token', token).json({
      id: userDoc._id,
      username,
    });
  } catch (e) {
    console.error(e);
    res.status(400).json('Wrong credentials');
  }
});


app.get('/profile', async (req, res) => {
  const { token } = req.cookies;
  try {
    const info = await verifyToken(token);
    res.json(info);
  } catch (err) {
    console.error(err);
    res.status(401).json('Unauthorized');
  }
});

app.post('/logout', (req, res) => {
  res.cookie('token', '').json('OK');
});

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
  const { originalname, path } = req.file;
  const newPath = renameFile(originalname, path);

  const { token } = req.cookies;
  try {
    const { title, summary, content } = req.body;
    const info = await verifyToken(token);
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author: info.id,
    });
    res.json(postDoc);
  } catch (err) {
    console.error(err);
    res.status(401).json('Unauthorized');
  }
});
app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    newPath = renameFile(originalname, path);
  }

  const { token } = req.cookies;
  try {
    const { id, title, summary, content } = req.body;
    const info = await verifyToken(token);
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    
    if (!isAuthor) {
      return res.status(400).json('You are not the author');
    }

    const updateFields = {
      title,
      summary,
      content,
    };

    if (newPath) {
      updateFields.cover = newPath;
    }

    const updatedPost = await Post.findByIdAndUpdate(id, updateFields, { new: true });

    res.json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(401).json('Unauthorized');
  }
});


app.get('/post', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', ['username'])
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json('Internal Server Error');
  }
});

app.get('/post/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
  } catch (err) {
    console.error(err);
    res.status(404).json('Post not found');
  }
});

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});
