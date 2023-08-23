//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose=require("mongoose");
const _=require("lodash");
const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/todoListDB").then(()=>{
    console.log("Database is connected");
})

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



const listSchema=new mongoose.Schema({
    name:String,
})

const List=new mongoose.model("List",listSchema);

const i1=new List({
    name:"Jog"
})

const i2=new List({
    name:"Eat an Apple"
})

const i3=new List({
    name:"Feed the dog"
})

const items=[i1,i2,i3];

const customSchema=new mongoose.Schema({
    name:String,
    item:[listSchema]
})

const Custom=new mongoose.model("Custom",customSchema);


app.get("/", function(req, res) {
  List.find().then( (data)=>{
    console.log(data)
    //Duplication htane k liye
    if(data.length===0){
        List.insertMany(items).then(()=>{
          console.log("default items added");
      })
      res.redirect("/")
    }else{
      res.render("list", {listTitle: "Today", newListItems: data});
    }

    

  })

  

});

app.get("/:pageName",function(req,res){
  const requestedPage=_.capitalize(req.params.pageName);
  
  Custom.findOne({name: requestedPage}).then((element)=>{
      if(!element){
        // Create a new List
        const i1=new Custom({
          name:requestedPage,
          item:items,
        })
        i1.save();
        res.redirect("/"+requestedPage);
        
      }else{
        res.render("list",{listTitle: requestedPage,newListItems:element.item})
      }
  })

 


})


app.post("/", function(req, res){

  const nitem = req.body.newItem;
  const customList=req.body.list;


  const ii=new List({
      name:nitem
  })

  if(customList=="Today"){
    ii.save();
    res.redirect("/");
  }else{
    Custom.findOne({name:customList}).then((element)=>{
        element.item.push(ii);
        element.save();
        res.redirect("/"+customList);
    })

  }


  
  
});



app.post("/delete",function(req,res){
    const checkedId=req.body.checkbox;
    const listName=req.body.listName;
    
    if(listName=="Today"){
      List.findByIdAndRemove({_id:checkedId}).then(()=>{
        console.log("Deleted the item")
      })
      res.redirect("/");

    }else{
      Custom.findOneAndUpdate({name:listName}, {$pull :{item: {_id:checkedId } } } ).then((element)=>{
        if(element){
          res.redirect("/"+listName);
        }
      })


    }

    
})


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
