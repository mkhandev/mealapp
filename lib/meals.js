import sql from "better-sqlite3";
import slugify from "slugify";
import xss from "xss";
import fs from "node:fs";
import cloudinary from "@/lib/cloudinary";

//const db = sql("meals.db");
import {db} from "./db.js";

export async function getMeals() {
  //throw new Error('Failed to fetch meals');
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return (await db.execute("SELECT * FROM meals")).rows;
}

export async function getMeal(slug) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  //return db.prepare("SELECT * FROM meals WHERE slug = ?").get(slug);
  return (await db.execute("SELECT * FROM meals WHERE slug = ?", [slug])).rows[0];
}


export async function saveMeal(meal) {
  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);
  //const extension = meal.image.name.split(".").pop();

  // const fileName = `${meal.slug}.${extension}`;
  // const stream = fs.createWriteStream(`public/images/${fileName}`);
  // const bufferedImage = await meal.image.arrayBuffer();

  // stream.write(Buffer.from(bufferedImage), (error) => {
  //   if (error) {
  //     throw new Error('Saving image failed!');
  //   }
  // });

  // meal.image = `/images/${fileName}`;

  const file = meal.image;
  const bytes = await file.arrayBuffer();
  const imageData = Buffer.from(bytes);

  const imageBase64 = imageData.toString("base64");

  const result = await cloudinary.uploader.upload(
    `data:image/png;base64,${imageBase64}`,
    {
      resource_type: "auto",
      folder: "mealapp",
    },
  );

  meal.image = result.secure_url;

  // db.prepare(
  //   `
  //   INSERT INTO meals
  //     (title, summary, instructions, creator, creator_email, image, slug)
  //   VALUES (
  //     @title,
  //     @summary,
  //     @instructions,
  //     @creator,
  //     @creator_email,
  //     @image,
  //     @slug
  //   )
  // `,
  // ).run(meal);

  await db.execute({
    sql: `
      INSERT INTO meals
        (title, summary, instructions, creator, creator_email, image, slug)
      VALUES
        (?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      meal.title,
      meal.summary,
      meal.instructions,
      meal.creator,
      meal.creator_email,
      meal.image,
      meal.slug,
    ],
  });
}
