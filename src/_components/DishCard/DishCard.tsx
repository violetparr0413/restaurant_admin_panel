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
        className="w-full max-w-sm !rounded-xl overflow-hidden border-none pb-2 box-border !shadow-[0_1px_4px_0_rgba(0,0,0,0.2)]"
        onClick={() => openDish(dish)}
      >
        <Box
          className="relative w-full rounded-t-xl bg-cover bg-center overflow-hidden md:h-[200px] h-[100px]"
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
        <Typography variant="body1" className="px-2 mt-2 md:h-20 h-12">
          {localizedDishName}
        </Typography>
        <Box className="px-2 flex items-center justify-between">
          <Typography variant="h6" className="px-1 !font-bold">
            {dish["dish_price"]}円
          </Typography>
          <Box className="flex items-center rounded-3xl border border-gray-400 !text-gray-400 px-2 py-1">
            <ShoppingCartIcon className="!text-xs"/>
            <Typography variant="body1" className=" !text-xs !font-light">Order</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
