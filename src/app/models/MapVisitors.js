import mongoose from "mongoose"
import { userAgent } from "next/server"

const MapVisitorSchema = new mongoose.Schema({
    pathName :String,
    userAgent:String,
    ip:String,
    timeStamp:{type: Date, default: Date.now}


})


export default mongoose.models.MapVisitor || mongoose.model("MapVisitor", MapVisitorSchema,"mapVisitors")