import AWS from "aws-sdk";

export async function uploadToS3(file: File) {
  try {
    AWS.config.update({
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
    });
    const s3 = new AWS.S3({
      params: { Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME },
      // region should be in singapore
      region: "ap-southeast-1",
    });

    const file_key =
      "uploads/" + file.name.replace(" ", "") + Date.now().toString();
    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME as string,
      Key: file_key,
      Body: file,
    };
    const upload = s3
      .putObject(params)
      .on("httpUploadProgress", (evt) => {
        console.log(
          "Uploading " +
            parseInt(((evt.loaded * 100) / evt.total).toString()).toString() +
            "%"
        );
      })
      .promise();

    await upload.then((data) => {
      // get url of the file
      const url = s3.getSignedUrl("getObject", {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME as string,
        Key: file.name,
      });
    });
    return Promise.resolve(file_key);

    console.log("success upload to s3");
  } catch (error) {
    console.log(error);
  }
}
