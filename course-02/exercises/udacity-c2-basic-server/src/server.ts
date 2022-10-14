import express, { Router, Request, Response } from 'express';
// import bodyParser from 'body-parser'; deprecated
const bodyParser = require('body-parser')

import { Car, cars as cars_list } from './cars';

(async () => {
  let cars:Car[]  = cars_list;

  //Create an express application
  const app = express(); 
  //default port to listen
  const port = 8082; 
  
  //use middleware so post bodies 
  //are accessable as req.body.{{variable}}
  app.use(bodyParser.json()); 
  app.use(express.urlencoded({ extended: true })) //for requests from forms-like data

  // Root URI call
  app.get( "/", ( req: Request, res: Response ) => {
    res.status(200).send("Welcome to the Cloud!");
  } );

  // Get a greeting to a specific person 
  // to demonstrate routing parameters
  // > try it {{host}}/persons/:the_name
  app.get( "/persons/:name", 
    ( req: Request, res: Response ) => {
      let { name } = req.params;

      if ( !name ) {
        return res.status(400)
                  .send(`name is required`);
      }

      return res.status(200)
                .send(`Welcome to the Cloud, ${name}!`);
  } );

  // Get a greeting to a specific person to demonstrate req.query
  // > try it {{host}}/persons?name=the_name
  app.get( "/persons/", ( req: Request, res: Response ) => {
    let { name } = req.query;

    if ( !name ) {
      return res.status(400)
                .send(`name is required`);
    }

    return res.status(200)
              .send(`Welcome to the Cloud, ${name}!`);
  } );

  // Post a greeting to a specific person
  // to demonstrate req.body
  // > try it by posting {"name": "the_name" } as 
  // an application/json body to {{host}}/persons
  app.post( "/persons", 
    async ( req: Request, res: Response ) => {

      const { name } = req.body;

      if ( !name ) {
        return res.status(400)
                  .send(`name is required`);
      }

      return res.status(200)
                .send(`Welcome to the Cloud, ${name}!`);
  } );
  // @TODO Add an endpoint to get a specific car
  // it should require id
  // it should fail gracefully if no matching car is found
  app.get("/cars/:id", (req: Request, res: Response) =>{
    const { id } = req.params
    if (!id){
      return res.status(400)
        .send("id is required")
    }
    for (let car of cars){
        if(String(car.id) === id)
           return res.status(200)
                  .send(car);
    }
    return res.status(404)
              .send(`Id: ${id} was not found.`)
    
  } );

  // @TODO Add an endpoint to GET a list of cars
  // it should be filterable by make with a query paramater
  app.get("/cars/", (req: Request, res: Response) => {
    const { make } = req.query
    if (!make)
          return res.status(200)
                 .send(cars);
     else 
          return res.status(200)
                    .send(cars.filter(({make: make2}) => make === make2));
  });

  /// @TODO Add an endpoint to post a new car to our list
  // it should require id, type, model, and cost
  app.post( "/cars", 
    async ( req: Request, res: Response ) => {
        const {id, type, model, cost, make} = req.body
        if (!id)
            return res.status(400).send("id is not specified in request body");
        if (!type)
            return res.status(400).send("type is not specified in request body");
        if (!model)
            return res.status(400).send("model is not specified in request body");
        if (!cost)
          return res.status(400).send("cost is not specified in request body");
        if (cars.some( ({id:id2}) => id == id2 ))
          return res.status(400).send(`car with id: ${id} is already present in cars list`);
        let newCar: Car = {make, type, model, cost, id};
        cars.push(newCar);
        return res.status(201)
              .send(newCar);

    } );
  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();
