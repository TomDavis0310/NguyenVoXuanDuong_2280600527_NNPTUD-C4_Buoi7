# Inventory endpoints and Postman testing

1. Start the server:

```bash
npm install
npm start
```

2. Import `inventory.postman_collection.json` into Postman.

3. Steps to test:
- Create or use an existing category id and replace `<categoryId>` in the Create Product request.
- Call `Create Product` to create a product (this also creates an inventory record automatically).
- Use `Get All Inventories` to find the `product` and inventory ids.
- Use `Add Stock`, `Remove Stock`, `Reserve`, and `Sold` requests (replace `<productId>` with the product _id).

Notes:
- The `POST /api/v1/inventories/reserve` reduces `stock` and increases `reserved`.
- The `POST /api/v1/inventories/sold` reduces `reserved` and increases `soldCount`.

You can add screenshots of Postman requests/responses into this file or create a Word doc for course submission.
