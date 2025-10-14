import {
  Box,
  Paper,
  Typography,
} from "@mui/material";
import { Dish } from "@/utils/info";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Image from "next/image";

interface DishCardProps {
  dish: Dish;
  currentLocale: string;
  openDish: (Dish) => void;
}

const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL2;

export default function DishCard({
  dish,
  currentLocale,
  openDish,
}: DishCardProps) {

  const localizedDishName =
    currentLocale === "ja"
      ? dish["dish_name"]
      : dish[`dish_${currentLocale}_name`] || dish["dish_name"];

  return (
    <Box>
      <Paper
        elevation={4}
        className="w-full max-w-sm !rounded-lg overflow-hidden border-none pb-2 box-border !shadow-[0_1px_4px_0_rgba(0,0,0,0.2)]"
        onClick={() => openDish(dish)}
      >
        <Box
          className="relative w-full rounded-t-lg bg-cover bg-center overflow-hidden md:h-[190px] h-[90px]"
          sx={{
            backgroundImage: `url("${backendUrl}/${dish["dish_image"]}")`,
          }}
        >
          {
            dish.dish_status == 1 &&
            <Image
              src='/images/special.png'
              width={80}
              height={80}
              alt="special"
              className="absolute -bottom-3 -right-3"
            />
          }
          {
            dish.dish_status == 2 &&
            <Image
              src='/images/popular.png'
              width={80}
              height={80}
              alt="special"
              className="absolute -bottom-3 -right-3"
            />
          }
        </Box>
        <Typography
          variant="body1"
          className="px-2 mt-2 !pt-1"                 // remove md:h-20 h-12 here
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: { xs: 2, md: 3 }, // 2 lines on phones, 3 on md+
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.2,
            // keep card heights consistent even when lines clamp
            minHeight: { xs: "calc(1.2em * 2)", md: "calc(1.2em * 3)" },
            // handle super-long unbroken words
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {localizedDishName}
        </Typography>
        <Box className="px-2 flex items-center justify-between">
          <Typography variant="h6" className="px-1 !font-bold">
            {dish["dish_price"]}円
          </Typography>
          {/* <Box className="flex items-center rounded-3xl border border-gray-400 !text-gray-400 px-2 py-1">
            <ShoppingCartIcon className="!text-xs"/>
            <Typography variant="body1" className=" !text-xs !font-light">Order</Typography>
          </Box> */}
        </Box>
      </Paper>
    </Box>
  );
}
