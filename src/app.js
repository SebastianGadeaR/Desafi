import express from 'express';
import handlebars from 'express-handlebars';
import productsRouter from './routers/products.router.js';
import cartsRouter from './routers/carts.router.js';
import __dirname from './utils.js';
import viewsRouter from './routers/view.router.js'  
import { Server } from 'socket.io';
import mongoose from 'mongoose';

const io = new Server(httpServer);
let productsOnList = ProductManager.getProduct();

const app = express();
const httpServer = app.listen(8080, ()=> console.log("Listening on PORT 8080"));

const socketServer = new Server(httpServer);

socketServer.on ('connection', socket =>{
    console.log("Nuevo cliente conectado");
    socket.on ('message', data => {
        console.log(data)
    })
})

app.engine('handlebars', handlebars.engine());
app.set('view',__dirname +'/views');
app.set('view engine','handlebars');
app.use(express.static(__dirname +'/public'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

io.on("connection", (socket) => {
    console.log("Connection with socket:", socket.id);

    socket.emit("productList", productsOnList);

    socket.on("newProduct", (data) => {
        ProductManager.addProduct(data);
        io.emit("productList", productsOnList);
        console.log("Product added", data);
    });

    socket.on("deleteProduct", (id) => {
        ProductManager.deleteProduct(id);
        io.emit("productList", productsOnList)
    });
})

try {
    await mongoose.connect('mongodb+srv://SebastianGadearodriguez:<YP8zfbJ1vc4YCcr6>@sfcoderhouse.cm3c7ba.mongodb.net/?retryWrites=true&w=majority');
    console.log('DB CONNECTED')
} catch (error) {
    console.log(error)
}

app.listen(8080);


