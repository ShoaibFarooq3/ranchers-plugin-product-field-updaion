import deals from "../utils/newFile.json";
import ReactionError from "@reactioncommerce/reaction-error";
import Random from "@reactioncommerce/random";
import { decodeShopOpaqueId, decodeProductOpaqueId } from "../xforms/id.js";
import generateVariants from "../utils/generateVariants.js";
export default {
  Mutation: {
    async createProductVariantScript(parent, { input }, context, info) {
      try {
        // console.log("deals ", deals);
        // let input;
        const { appEvents, collections, userId } = context;
        const { Products } = collections;
        let inputValue;
        let { productId, shopId } = input;
        // console.log("input", input);
        let productInfo = await Products.find({
          _id: decodeProductOpaqueId(productId),
        }).toArray();
        // console.log("productInfo", productInfo[0]);
        // console.log("productInfo", productInfo[0]?.Attributes.length);

        if (productInfo[0]?.Attributes) {
          let functionCall = await generateVariants(productInfo[0]?.Attributes);
          // console.log("functionCall", functionCall.length);
          // for (let index = 0; index < functionCall.length; index++) {
          //   const element = functionCall[index];
          //   console.log("element", element);
          // }
          // const Attributes = [];

          functionCall.forEach(async (element) => {
            // console.log("element.length", element.length);
            let flavors = [];
            let flavourName = [];
            // console.log("element.length", element);
            for (let i = 1; i <= productInfo[0]?.Attributes.length; i++) {
              // Change the loop limit as needed
              let flavorKey = element[`key ${i}`];
              let flavorName = element[`name ${i}`];
              let flavorValue = element[`value ${i}`];
              // let favorName = element[`value ${i}`];
              // let flavourName1 = [flavorValue];
              flavors.push({
                key: flavorKey,
                name: flavorName,
                value: flavorValue,
              });
              flavourName.push(flavorValue.replace(/\[|\]/g, ""));
              // console.log("flavourName", flavourName);
              inputValue = {
                // shopId: decodeShopOpaqueId(shopId),
                // productId: decodeProductOpaqueId(productId),
                // variant:
                // {
                _id: Random.id(),
                ancestors: [decodeProductOpaqueId(productId)],
                isDeleted: false,
                isVisible: true,
                attributeLabel: productInfo[0].title,
                optionTitle: flavourName.join(", "),
                sku: "ranchers-1295",
                title: flavourName.join(", "),
                price: productInfo[0].regularPrice,
                Drinks: productInfo[0].Drinks,
                isFeatured: "0",
                Attributes: flavors,
                Parent: decodeProductOpaqueId(productId),
                shopId: decodeShopOpaqueId(shopId),
                isTaxable: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                workflow: {
                  status: "new",
                },
                type: "variant",
              };
            }
            // console.log("inputValue", inputValue);
            let variantResp = await Products.insertOne(inputValue);
            console.log("variantResp", variantResp);

            // Attributes.push(flavors);
          });
        }
        return true;
        // deals.forEach(async (element) => {
        //   console.log("element", element);
        //   // console.log("element", element.price);
        //   input = {
        //     shopId: "cmVhY3Rpb24vc2hvcDo0TjNzNlNCQ0VUNWpuNlJHZg==",
        //     productId: "cmVhY3Rpb24vcHJvZHVjdDpXY0V3QXJNRnBSTUJ3YjJnag==",
        //     variant: {
        //       isDeleted: false,
        //       isVisible: true,
        //       attributeLabel:
        //         element.Flavors_1 +
        //         ", " +
        //         element.Flavors_2 ,
        //       optionTitle:
        //         element.Flavors_1 +
        //         ", " +
        //         element.Flavors_2 ,
        //       sku: "nan",
        //       title:
        //         element.Flavors_1 +
        //         ", " +
        //         element.Flavors_2 ,
        //       price: element.price,
        //       isFeatured: "0",
        //       Attributes: [
        //         { key: "Flavor 1", name: "Flavor 1", value: element.Flavors_1 },
        //         { key: "Flavor 2", name: "Flavor 2", value: element.Flavors_2 },
        //         // { key: "Drink", name: "Drink", value: element.Drink },
        //       ],
        //       Parent: "cmVhY3Rpb24vcHJvZHVjdDpXY0V3QXJNRnBSTUJ3YjJnag==",
        //       isTaxable: true,
        //     },
        //   };
        //   console.log("input ", input);
        //   // const variantResp = await context.mutations.createProductVariant(
        //   //   context,
        //   //   {
        //   //     productId: decodeProductOpaqueId(input.productId),
        //   //     shopId: decodeShopOpaqueId(input.shopId),
        //   //     variant: input.variant,
        //   //   }
        //   // );
        //   // console.log("variantResp ", variantResp);
        //   // if (variantResp) {
        //   //   return true;
        //   // } else {
        //   //   return false;
        //   // }
        // });
      } catch (error) {
        console.log("error ", error);
        throw new ReactionError("access-denied", `${error}`);
      }
    },
    async updateProductVariantScript(parent, { input }, context, info) {
      console.log("input ", input);
    },
    async updateAny2DealVariants(parent, { input }, context, info) {
      console.log("input", input);
      let { id } = input;
      const { Products } = context.collections;
      let productsResponse = await Products.find({
        ancestors: [id],
        title: { $regex: "\\(\\+ RS 99\\)", $options: "i" },
      }).toArray();
      console.log("productsResponse", productsResponse);
      // Iterate over the products
      if (productsResponse) {
        for (let product of productsResponse) {
          // Count the occurrences of "(+ RS 99)" in the title
          let count = (product.title.match(/\(\+ RS 99\)/gi) || []).length;
          // console.log("count", count);
          // if (count = 0) {
          //   console.log("count", count);
          // }// { $set: { price: 1497 } } // { $set: { price: 1398 } }
          // Update the price based on the count if 99 come 1 time in title
          if (count === 1) {
            console.log("count if", count);
            await Products.updateOne(
              { _id: product._id },
              {
                $set: {
                  price: 1398,
                  updatedAt: new Date(),
                },
              }
            );
          } else if (count === 2) {
            console.log("count else if", count);
            await Products.updateOne(
              { _id: product._id },
              {
                $set: {
                  price: 1497,
                  updatedAt: new Date(),
                },
              }
            );
          }
        }
      }
      let productsResponseWithout99PriceTag = await Products.find({
        ancestors: [id],
        title: { $not: { $regex: "99", $options: "i" } },
      }).toArray();
      if (productsResponseWithout99PriceTag) {
        console.log(
          "productsResponse else",
          productsResponseWithout99PriceTag.length
        );
        for (let product of productsResponseWithout99PriceTag) {
          console.log("product", product);
          await Products.updateOne(
            { _id: product._id },
            {
              $set: {
                price: 1299,
                updatedAt: new Date(),
              },
            }
          );
        }
      }
      return true;
    },
    async updateTrioFeastDealVariants(parent, { input }, context, info) {
      console.log("input", input);
      let { id } = input;
      const { Products } = context.collections;
      let productsResponse = await Products.find({
        ancestors: [id],
      }).toArray();
      console.log("productsResponse", productsResponse.length);
      for (let product of productsResponse) {
        console.log("product", product);
        await Products.updateOne(
          { _id: product._id },
          {
            $set: {
              price: 1599,
              updatedAt: new Date(),
            },
          }
        );
      }
      return true;
    },
  },
};
