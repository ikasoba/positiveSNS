export const getProp=<T=any>(
  o:any,
  k:any,
  match?:string|RegExp,
  convert:(v:any)=>T=(v:any)=>v
):T => {
  if (o[k]==null){
    throw new Error(`${k} is null`);
  }else if (
    !(typeof match === "string" ? typeof o[k] === match
    : o[k].match(match))){
      throw new Error(`${k} is does not match ${match instanceof RegExp ? `/${match.source}/` : match}`);
    }
  return convert(o[k]);
};
export default {
  sql(){
    return {
      user: getProp(process.env,"postgresUser"),
      host: getProp(process.env,"postgresHost"),
      database: getProp(process.env,"postgresDB"),
      password: getProp(process.env,"postgresPass"),
      port: getProp<number>(process.env,"postgresPort",/^[0-9]{0,5}$/,(v)=>parseInt(v))
    }
  }
}