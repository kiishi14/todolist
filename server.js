require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public"));

const PORT = process.env.PORT || 3000;

// mongoose.connect(
//   "mongodb+srv://admin-kiishi:Frontend2022@cluster0.zmp4w8z.mongodb.net/todolistDB",
//   {
//     useNewUrlParser: true,
//   }
// );
mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

// const connectDB = async (err) => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URL);
//     console.log(`Mongodb connect: ${conn.connection.host}`);
//   } catch {
//     console.log(err);
//     process.exit(1);
//   }
// };

// let conn = mongoose.connect(process.env.MONGO_URI);
// console.log(`connected: ${conn.connection.host}`);

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist",
});

const item2 = new Item({
  name: "Hit the + button to add an item",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("list", listSchema);
// Item.deleteOne({ _id: "63da544708acaf10d4aba316" }, function (err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Successfullly Deleted");
//   }
// });
// Item.insertMany(defaultItems, function (err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("successfully added to the database");
//   }
// });

// item3.save();
// let items = ["Buy Food", "Cook Food", "Eat Food"];
// let workItems = [];

// Item.updateOne(
//   { _id: "63d8f7488a62daa50f9eb4a5" },
//   { name: "<-- Hit this to delete an item" },
//   function (err) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log("successfully updated");
//     }
//   }
// );

app.get("/", function (req, res) {
  // let day = date.getDate();
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully added to the database");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);.
  //   res.redirect("/");
  // }
});

app.post("/delete", function (req, res) {
  const checked = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checked, function (err) {
      if (!err) {
        console.log("removed successfully");
        res.redirect("/");
      } else {
        console.log(err);
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checked } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

app.get("/about", function (req, res) {
  res.render("about");
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
  });
});
