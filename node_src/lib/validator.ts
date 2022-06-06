import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv();
addFormats(ajv);

export default {
  isUserTag(text:string): boolean {
    return text.match(/^[a-zA-Z0-9_]+$/) ? true : false
  },
  isInteger:(data:unknown,min?:number,max?:number)=>ajv.validate({
    type:"integer",
    minimum:min,
    maximum:max
  },data),
  newNumberValidator:(type="number",min?:number,max?:number)=>ajv.compile({
    type:type,
    minimum:min,
    maximum:max
  }),
  isUUID:ajv.compile<string>({
    type:"string",
    format:"uuid"
  }),
  isMail:<T=string>(data:unknown,maxLength?:number,minLength?:number):data is T=>ajv.validate<T>({
    type:"string",
    format:"email",
    maxLength,
    minLength
  },data),
  newMailValidator:<T=string>(maxLength?:number,minLength?:number)=>ajv.compile<T>({
    type:"string",
    format:"email",
    maxLength,
    minLength
  }),
}