const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { name } = require("ejs");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://salsabeel:2dDCqHL58WhX4cS@atlascluster.s4ggcco.mongodb.net/todolistDB",{useNewUrlParser: true});


const itemSchema = {
  name:String
};

const Item= mongoose.model("item",itemSchema);

const item1 = new Item({
  name: "Welcome to TodoList!"
});

const item2 = new Item({
  name: "Hit + Button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const DefaultItem = [item1,item2,item3];

const listSchema = {
  name:String,
  item:[itemSchema]
}

const List = new mongoose.model("list", listSchema);

app.get("/", function(req, res) {
  
  Item.find({})
.then(foundItems => {
  if(foundItems.length===0){
    Item.insertMany(DefaultItem);
    res.redirect("/")
  } else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
 });

});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then(foundList => {
      if (foundList) {
        res.render("list", {listTitle:foundList.name, newListItems: foundList.item});
      } else {
        const list = new List({
          name:customListName,
          item:DefaultItem
        });
        list.save()
        res.redirect("/"+customListName)
         
      }
    })
    .catch(err => console.log(err));
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item= new Item({
    name:itemName
  });
  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }else {
    List.findOne({name:listName})
    .then((foundList)=>{
      foundList.item.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
    .catch(err => console.log(err));
  }
  
});

app.post("/delete",(req,res)=>{
  const checkedId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedId)
   .then((err)=>{
    if (err) {
      console.log("Success Fully Deleted");
    }
   })
  res.redirect("/");
  } else{
    List.findOneAndUpdate({name:listName},{$pull:{item:{_id:checkedId}}})
    .then((foundList,err)=>{
      if(!err)
      res.redirect("/"+listName);
    })
    
  } 
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
