import { db } from "../lib/db.js";
import { dummyMeals } from "./dummy-meals.js";

//console.log(dummyMeals);


for (const meal of dummyMeals) {
  await db.execute({
    sql: `
      INSERT INTO meals (
        title,
        slug,
        image,
        summary,
        instructions,
        creator,
        creator_email
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      meal.title,
      meal.slug,
      meal.image,
      meal.summary,
      meal.instructions,
      meal.creator,
      meal.creator_email,
    ],
  }); 

}

console.log("Meals inserted");