const {format} = require('util');
const express = require('express');
const Multer = require('multer');
const cors = require ("cors");
const {auth, Compute} = require('google-auth-library');


const {Storage} = require('@google-cloud/storage');
const app = express();
const port = 8080;

const multer = Multer({
    storage : Multer.memoryStorage(),
    limits : {
        fileSize: 5* 1024* 1024
    },
})

process.env.CRED = JSON.stringify({
  "type": "service_account",
  "project_id": "metal-repeater-352000",
  "private_key_id": "b3dc9606ddbf7bcb7614064039cf09c5021e2487",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCr3/5Dfrt0enoE\nnHYQiV648hYp1nj/kLPGNs/MTypACS468ycq+to0YqLs1FekpEG2YObc1hg719OQ\n7+OaNZqi/BL4x4lVCizs0eT1elNW+1iKoiwmGi6FH/xd+xJIrML/MktAYopqIXBG\ngCbrf8RXEhXbLxmKKbA1TdCR1JdAJ1tGbltNDhu4IV4K5wsoh0VbskESs1SxHW1o\n45wSc0BgSaDxEs90U4FUFCKpozueJgkcTu72xyVC3YSKjdFe1LRjFEIpnZUHOayT\na/aqIb5Z7tQefNBHTdM8TwkUPfWpIthSu0Au0g+FUAe2fe8aR+4cwbAenrdeqUl5\nPGzqSAFJAgMBAAECggEAAYgVc/SFJxyQSco7IxqWRX+iwuyuV1iqwXFrmJ57+eYb\nC1tvVeq2VxEp8oJR5Z2xGDb017LwtFfQAtKgbJddsWYdpSniB2f3zoRwTd+xLm0+\n9L1NN2m0UGtgjFXYa91eP3frQ7+dDCUQIxCxSBfzX/NBTpq0145Xi6IN4b7LOj8b\ny2T70L5JcQsFGqjCb0yxpOAPB/HwvODwZujKvq2PG0oYADToOhfxMwDOKlOdQ8LM\nphlu5NkjxdzZb33xJoyHoJwQE45eS1mLWgmm/Esg7cH6AgeJkXqoZl5UYeC9rD+a\nWUXbIAku6dsyKB0+iInhwg792kpXyOLn+RTMZPkMAQKBgQDZ0lESKG/OtsEathUH\no7kH70OL89URtvZ5KPjNrj+fe3gWT7GS+5PkeeNd3NYOjqbxERxoMQpsPRWaTvcL\nUIeI5dfN6JVqRBDgrnFONkxOH+O7IedC3bQpw9tfTHjcH67VUoum4cXi4VOg+hic\nJDfpK6GeiYfec3di7kzwONaEUQKBgQDKAAwZCyYcNAXlqevV52EdLJAQTAgLYp9h\nB0jEGmy1kCDBu0h/ijVm9V3Yd9th7+geqdiqmCImLBVfkAa2D1F55NLyqutNE+M6\nix1HKUNeTc+VeidDUrTkoxdHf2Ma204NIyoqAYPeKFJQPmlseyQNvDGkTt3T/w50\nk11OU+FHeQKBgQC3Pgw/p07v6qSm8PjeFWjKeQktCnJ71ZyhrssoVOdnJjqPInnz\nebsf4T5aLzbQxkdA07E/Icpv5i9vQfDoTtXGX/1dVsWjwSElsvrU3i7xJjixq8Le\naJ5w6Dh7glzGaczt3uRm/tY3mHF/IgZkDMAQY0kykuZ/SEnuKyUEjfxBEQKBgBoE\nYYqENhdh1/SZqyd00rxINhHzSQH2ZOLBZmzjnmbQNnfdYFwU+AXXyouL/HSjyrjQ\nVXi7eYKDIQma6lJerLbPcyAQRZg63IR40H+O3/9wdDEjd5UjPOtJ2kC6NpCJ+IaW\npeKdKVfex6NQNpHjVmRyfc5U3htk+X6oUFc7VIO5AoGBAIQebWno1vWkq8qtt2mg\nXxwEh/NIbMLc9muNat/lSDot5eySr5gcLnhTBDBCeMlQ+cxtdripJzBdPibjGkM3\njB0VDElxBEW7wSTKmWpwqAEUjMzAIq9o7odTmIZqjYMTPlsv1E2iL9TLMaeDviyN\ndxNehKnxQ5foE2c1v5xfgVOB\n-----END PRIVATE KEY-----\n",
  "client_email": "kas-service@metal-repeater-352000.iam.gserviceaccount.com",
  "client_id": "108488608667337957454",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/kas-service%40metal-repeater-352000.iam.gserviceaccount.com"
})
//authentication to google 

const keysEnvVar = process.env.CRED;

if (!keysEnvVar){
  throw new Error ("No credentials found")
}

const keyFileName = JSON.parse(keysEnvVar)

const client = auth.fromJSON(keyFileName);


const cloudStorage =  new Storage({
  projectId: keyFileName.projectId,
  credentials: keyFileName});

const bucketName = "kas-audio";

const bucket = cloudStorage.bucket(bucketName);



app.use(cors());
// Process the file upload and upload to Google Cloud Storage.

app.get('/favicon.ico', (req, res) => res.status(204));

app.get("/", (req, res) => {
  res.send("hello world")
})

app.post('/upload', multer.single('audio-file'), (req, res, next) => {
    if (!req.file) {
      res.status(400).send('No file uploaded.');
      return;
    }
  
    // Create a new blob in the bucket and upload the file data.
    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream();
  
    blobStream.on('error', err => {
      next(err);
    });
  
    blobStream.on('finish', () => {
      // The public URL can be used to directly access the file via HTTP.
      const publicUrl = format(
        `gs://${bucket.name}/${blob.name}`
      );
      
      res.status(200).send({url: publicUrl})
      
     
    });
    blobStream.end(req.file.buffer);
  });
 
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
    console.log('Press Ctrl+C to quit.');
  });
