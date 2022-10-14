import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import {Request, Response, Express} from 'express';

(async () => {

  // Init the Express application
  const app: Express = express();

  // Set the network port
  const port: string | number = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */
  app.get("/filteredimage",  async (req: Request, res: Response) => {
      
      const { image_url }: {image_url: string} = req.query

      if (!image_url)
        return res.status(400).send({message: "Image url is required as a query parameter"});
      
      try{
        const url: string = await filterImageFromURL(image_url);
        res.status(200).sendFile(url, (err: any) => {
            if (err)
            {
              res.status(500).send({message: "Encountered error while sending file"});
            }
            deleteLocalFiles([url]);
        });
        
      } catch(error){
        res.status(422).send({message: "Error while processing Image", error: error});
      }
  });
  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req: Request, res: Response ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();