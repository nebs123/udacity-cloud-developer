import { Router, Request, Response } from 'express';
import { FeedItem } from '../models/FeedItem';
import { requireAuth } from '../../users/routes/auth.router';
import * as AWS from '../../../../aws';

const router: Router = Router();

// Get all feed items
router.get('/', async (req: Request, res: Response) => {
    const items = await FeedItem.findAndCountAll({order: [['id', 'DESC']]});
    items.rows.map((item) => {
            if(item.url) {
                item.url = AWS.getGetSignedUrl(item.url);
            }
    });
    res.send(items);
});

//@TODO
//Add an endpoint to GET a specific resource by Primary Key
router.get('/:id',
    async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id){
             return res.status(400)
              .send({message: "id is required"});
        }
        const item: FeedItem = await FeedItem.findByPk(id);
        console.log(item);
        if (item)
        {
            const item_obj = item.get();
            item_obj.url = AWS.getGetSignedUrl(item_obj.url);
            console.log(item_obj);
            res.status(200).send(item_obj); 
        }
        else 
            res.status(404).send({message: `Feed item with id ${id} was not found`});
});
// update a specific resource
router.patch('/:id', 
    requireAuth, 
    async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id){
            return res.status(400)
             .send({message: "id is required"});
       }
       const { url, caption } = req.body
        if (!url)
            return res.status(400).send({message: "url was not specified in request body"});
        if (!caption)
            return res.status(400).send({message: "caption was not specified in request body"});
       const item: FeedItem = await FeedItem.findByPk(id);
       if (item)
       {
            item.url = url;
            item.caption = caption;
            const saved_item  = await item.save();
            saved_item.url = AWS.getPutSignedUrl(saved_item.url); //might need to be changed to AWS.getPutSignedUrl
            res.status(200).send(saved_item);
       } else
            res.status(404).send({message:`Feed item with id ${id} was not found`});

});


// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName', 
    requireAuth, 
    async (req: Request, res: Response) => {
    let { fileName } = req.params;
    const url = AWS.getPutSignedUrl(fileName);
    res.status(201).send({url: url});
});

// Post meta data and the filename after a file is uploaded 
// NOTE the file name is they key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post('/', 
    requireAuth, 
    async (req: Request, res: Response) => {
    const caption = req.body.caption;
    const fileName = req.body.url;

    // check Caption is valid
    if (!caption) {
        return res.status(400).send({ message: 'Caption is required or malformed' });
    }

    // check Filename is valid
    if (!fileName) {
        return res.status(400).send({ message: 'File url is required' });
    }

    const item = await new FeedItem({
            caption: caption,
            url: fileName
    });

    const saved_item = await item.save();
    saved_item.url = AWS.getGetSignedUrl(saved_item.url);
    res.status(201).send(saved_item);
    
});

export const FeedRouter: Router = router;
