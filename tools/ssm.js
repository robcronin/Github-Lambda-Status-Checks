import Aws from "aws-sdk";

const ssm = new Aws.SSM({
  region: "eu-west-1"
});

// WARNING: if multiple names are passed, they will be returned in alphabetical order based on the key names
//    i.e. not necessarily in the order you provide them
const getSSMParameters = namesArray =>
  new Promise((resolve, reject) => {
    ssm.getParameters(
      {
        Names: namesArray,
        WithDecryption: true
      },
      (err, data) =>
        err
          ? reject(err)
          : resolve(data.Parameters.map(parameter => parameter.Value))
    );
  });

export default getSSMParameters;
