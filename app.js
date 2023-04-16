//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express();

mongoose.connect('mongodb+srv://admin:test123@cluster0.uqmu2cq.mongodb.net/todolistDB');

const itemsSchema = new mongoose.Schema({
  name : String,
})

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name:"Wakup at 5:00"
})

const item2 = new Item({
  name:"Pray"
})

const item3 = new Item({
  name:"Start Programing"
})

const defaultItems = [item1, item2, item3]

const listScheam = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = mongoose.model("List", listScheam)

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", function(req, res) {

  const day = date.getDate();  

  Item.find().catch((err)=> {
    console.log(err)
  }).then((items)=>{

    if (items.length === 0) {
      Item.insertMany(defaultItems).catch((err)=> {
        console.log(err);
      }).then(()=>{
        console.log("saving your items was seccued");
        res.redirect("/")
      })
    } else {
      res.render("list", {listTitle: "Today", newListItems: items});
    }

  })

});

app.get("/:customListName", function(req, res){

  const customLIstName =_.capitalize(req.params.customListName) 

  List.findOne({name: customLIstName}).catch((err)=>{
    console.log(err);
  }).then((listFound)=>{
    if(listFound){
      res.render("list", {listTitle: customLIstName, newListItems: listFound.items});
    }else {
      const list = new List({
        name: customLIstName,
        items: defaultItems
      })
  
      list.save()

      res.redirect("/" + customLIstName)
    }
  })

})

app.post("/", function(req, res){

  const itemName = req.body.newItem

  const listName = req.body.list

  const newItem = new Item({
    name: itemName
  })

  if (listName === "Today") {

    newItem.save()

    res.redirect("/")

  } else {

   List.findOne({name: listName}).catch((err)=>{
    console.log(err);
   }).then((listFound)=>{
    listFound.items.push(newItem)
    listFound.save()
    res.redirect("/" + listName)
   })


  }

});

app.post("/delete", function(req, res){

  const itemId = req.body.checkbox
  const listTitle =req.body.listName

  if(listTitle === "Today"){
    Item.findByIdAndRemove(itemId).catch((err)=>{
      console.log(err);
    }).then(()=>{
      console.log("deleted")
    })
  
    res.redirect("/")
  
  } else {
    List.updateOne({name: listTitle}, {$pull : {items : {_id: itemId}}}).then(()=>{
      console.log("updated")
      res.redirect("/" + listTitle)
    })
  }

})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
