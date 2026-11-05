const router = require("express").Router();
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  createItemSchema,
  updateItemSchema,
  listQuerySchema,
  idParamSchema,
} = require("../schemas/item.schema");
const {
  createItem,
  listItems,
  updateItem,
  deleteItem,
} = require("../controllers/item.controller");

router.use(auth);

router.post("/", validate(createItemSchema), createItem);
router.get("/", validate(listQuerySchema, "query"), listItems);
router.put("/:id", validate(idParamSchema, "params"), validate(updateItemSchema), updateItem);
router.delete("/:id", validate(idParamSchema, "params"), deleteItem);

module.exports = router;