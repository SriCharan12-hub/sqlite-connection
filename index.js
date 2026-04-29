
const express = require("express")
const path = require("path")
const {open} = require("sqlite")
const sqlite3 = require("sqlite3")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const app = express()
app.use(express.json())
const initialize = async()=>{
    try{
        const datapath = path.join(__dirname,"reading.db")
        db = await open({
            filename:datapath,
            driver:sqlite3.Database
        })
        app.listen(3000,()=>{
            console.log("server running on port 3000")
        })
    }
    catch(error){
        console.log(error)
    }
}
initialize()

app.get("/",(req,res)=>{
    res.send("server working fine")
})

app.post("/login",(req,res)=>{
    const {username,password}=req.body
    if(username=="charan" && password=="wild"){
        const payload={username:username}
        const token=jwt.sign(payload,"Hello")
        res.send(token)
    } else {
        res.status(401).send("Invalid credentials")
    }
})

app.post("/create",async(req,res)=>{
    try{
    const query=await `CREATE TABLE FRIENDS (ID INT, NAME TEXT)`
    await db.run(query)
    res.send("creating table done")
    }
    catch(error){
        res.send("error in creating details",error)
    }
})

app.post("/add",async(req,res)=>{
    try{
    const {name}=req.body 
    const hashedname = await bcrypt.hash(name,10)
    
    // Get max ID and auto-increment
    const result = await db.get("SELECT MAX(ID) as maxId FROM FRIENDS")
    const newId = (result.maxId || 0) + 1
    
    const query = `INSERT INTO FRIENDS (ID,NAME) VALUES(?,?)`
    await db.run(query, [newId, hashedname])
    res.send("added values with ID: " + newId)
    }
    catch(error){
        res.send("unable to add values",error)

    }

})

app.get("/details",async(req,res)=>{
    try{
        const query=`SELECT * FROM FRIENDS`
        const data=await db.all(query)
        res.send("fetched all details",)
    }
    catch(error){
        res.send("unable to fetch details",error)
    }
})

app.put("/update/:id",async(req,res)=>{
    try{
        const {id} = req.params
        const {name} = req.body
        const query = `UPDATE FRIENDS SET NAME='${name}' WHERE ID=${id}`
        await db.run(query)
        res.send("updated successfully")
    }
    catch(error){
        res.send("error updating details", error)
    }
})

app.delete("/delete/:id",async(req,res)=>{
    const {id}=req.params
    const query=`DELETE FROM FRIENDS WHERE ID=${id}`
    const data=await db.run(query)
    console.log(data)

})

const middleware = (req,res,next) =>{
    const data = req.headers.authorization || ""
    const token = data.split(" ")[1]
    if(!token){
        return res.send("there is no token")
    }
    const valid = jwt.verify(token,"Hello",(error,suucess)=>{
        if(error){
            res.send("error")
        }
        else{
            next()
        }
       
    })

}

