import { NextApiRequest, NextApiResponse } from "next";
import { without } from "lodash";

import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/serverAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      // const { currentUser } = await serverAuth(req);
      const { movieId, currentUser } = req.body;
      const existingMovie = await prismadb.movie.findUnique({
        where: {
          id: movieId,
        },
      });
      // return res.status(200).json(existingMovie);
      if (!existingMovie) {
        throw new Error("Invalid ID");
      }

      const user = await prismadb.user.update({
        where: {
          email: currentUser.email || "",
        },
        data: {
          favoriteIds: {
            push: movieId,
          },
        },
      });

      return res.status(200).json(user);
    }
    if (req.method === "DELETE") {
      const { currentUser } = await serverAuth(req);
      const { movieId } = req.query;

      const existingMovie = await prismadb.movie.findUnique({
        where: {
          id: JSON.parse(JSON.stringify(movieId)),
        },
      });
      if (!existingMovie) {
        throw new Error("Invalid ID");
      }

      const updatedFavoriteIds = without(currentUser.favoriteIds, movieId);
      const updatedUser = await prismadb.user.update({
        where: {
          email: currentUser.email || "",
        },
        data: {
          favoriteIds: JSON.parse(JSON.stringify(updatedFavoriteIds)),
        },
      });

      return res.status(200).json(updatedUser);
    }
    return res.status(405).end();
  } catch (err) {
    console.log(err);
    return res.status(500).end();
  }
}
