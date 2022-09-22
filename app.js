
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://AbuEssa:3ljgObd8mFcaFcKk@cluster0.fp8mmw2.mongodb.net/todolistDB");

const itemsSchema={
  name:String
};

const Item=mongoose.model("item",itemsSchema);

const item1=new Item({
  name:"Welcome to your to do list!"
});
const item2=new Item({
  name:"Hit the + button to add a new item."
});
const item3=new Item({
  name:"<-- Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

Item.find({},function(err,foundItems){
  if (foundItems.length===0) {
    Item.insertMany(defaultItems,function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("Succses");
      }
    });
    res.redirect("/");
  } else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
})


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });

if (listName==="Today") {

  item.save();
  res.redirect("/");
} else {
  List.findOne({name:listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
}


});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if (listName==="Today") {
    Item.findByIdAndRemove(checkedItemId,function(err){
      if (!err) {
        console.log("Succsesfuly deleted");
          res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if (!err) {
        res.redirect("/"+listName);
      }
    });
  }


});

app.get("/:listName",function(req,res){
  const listName=_.capitalize(req.params.listName);

  List.findOne({name:listName},function(err,foundList){
if (!err) {
  if (!foundList) {
    //Create new list
    const list=new List({
      name:listName,
      items:defaultItems
    });
      list.save();
      res.redirect("/"+listName);

  } else {
    //Show the saved list
    res.render("list", {listTitle: foundList.name, newListItems: foundList.items});

  }
}
  });


});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port=process.env.PORT;
if (port==null || port=="") {
  port=3000;
}


app.listen(port, function() {
  console.log("Server has started");
});
