import sql from "better-sqlite3";
import slugify from "slugify";
import xss from "xss";
import fs from "node:fs";
import cloudinary from "@/lib/cloudinary";

const db = sql("meals.db");

export async function getMeals() {
  //throw new Error('Failed to fetch meals');
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return db.prepare("SELECT * FROM meals").all();
}

export async function getMeal(slug) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return db.prepare("SELECT * FROM meals WHERE slug = ?").get(slug);
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

  db.prepare(
    `
    INSERT INTO meals
      (title, summary, instructions, creator, creator_email, image, slug)
    VALUES (
      @title,
      @summary,
      @instructions,
      @creator,
      @creator_email,
      @image,
      @slug
    )
  `,
  ).run(meal);
}
