"use client";

import {
  Badge,
  Box,
  Grid,
  List,
  ListItem,
  ListItemButton,
  Popover,
  Typography,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useRouter } from "next/router";
import DishCard from "@/_components/DishCard/DishCard";
import type { Swiper as SwiperType } from "swiper";
import LanguageIcon from "@mui/icons-material/Language";
import HistoryIcon from "@mui/icons-material/History";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import RoomServiceIcon from "@mui/icons-material/RoomService";
import Image from "next/image";
import { useClientUI } from "@/_components/ClientUIProvider";

const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL2;

export default function OrderingComponent() {
  const { t } = useTranslation("common");

  const {
    categories,
    logoPath,
    parentCategory,
    childCategory,
    dishes,
    childIndex,
    setParentCategory,
    setChildCategory,
    setDishes,
    setParentIndex,
    setChildIndex,
    cartCount,
    orderCount,

    openDish,
    openCart,
    openCallService,
    openOrderHistory,
  } = useClientUI();

  const router = useRouter();
  const currentLocale = router.locale;

  const Languages = {
    ko: { label: "조선어", flag: "/images/ko.jpg" },
    en: { label: "English", flag: "/images/en.jpg" },
    zh: { label: "中文", flag: "/images/zh.jpg" },
    ja: { label: "日本語", flag: "/images/ja.jpg" },
  };

  const { locales, pathname, query, asPath } = router;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleSelect = (lng: string) => {
    localStorage.setItem("locale", lng);
    if (lng !== router.locale) {
      router.push({ pathname, query }, asPath, { locale: lng });
    }
    handleClose();
  };

  const childSwiperRef = useRef<SwiperType | null>(null);

  function updateParentByIndex(index: number) {
    const category = categories[index];
    if (!category) return;
    setParentCategory(category);
    setParentIndex(index);

    if (category.children && category.children.length > 0) {
      setChildCategory(category.children[0]);
      setDishes(category.children[0].dishes);
      setChildIndex(0);

      // Reset child swiper to first slide on parent change
      if (childSwiperRef.current) {
        childSwiperRef.current.slideTo(0);
      }
    } else {
      setChildCategory({});
      setDishes(category.dishes);
      setChildIndex(-1);
    }
  }

  function handleClickParentCategory(category: any) {
    const index = categories.findIndex(
      (c) => c.category_id === category.category_id
    );
    if (index !== -1) {
      updateParentByIndex(index);
    }
  }

  function handleClickChildCategory(category: any, index: number) {
    setChildCategory(category);
    setDishes(category.dishes);
    setChildIndex(index);

    if (childSwiperRef.current) {
      childSwiperRef.current.slideTo(index);
    }
  }
  // const currentLangLetter =
  //   Languages[router.locale as keyof typeof Languages]?.label[0] || "";

  return (
    <Box className="w-[100vw]">
      <Box className="shadow sticky top-0 z-50">
        <Box className="flex items-center justify-between py-3 px-5  !bg-[white]">
          <Box className="flex gap-5">
            <Box
              onClick={handleOpen}
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                gap: 0.5,
              }}
            >
              <LanguageIcon />
              {/* <Typography variant="body2" fontWeight="bold">
              {currentLangLetter}
            </Typography> */}
            </Box>
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              PaperProps={{ sx: { minWidth: 160, p: 1 } }}
            >
              <List>
                {locales?.map((lng) => {
                  const lang = Languages[lng as keyof typeof Languages];
                  return (
                    <ListItem key={lng} disablePadding>
                      <ListItemButton
                        onClick={() => handleSelect(lng)}
                        selected={lng === router.locale}
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {/* <Avatar src={lang.flag} alt={lang.label} sx={{ width: 24, height: 24 }} /> */}
                        <Typography sx={{ fontWeight: 500 }}>
                          {lang.label}
                        </Typography>
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Popover>
            <Box onClick={openCallService} sx={{ cursor: "pointer" }}>
              <RoomServiceIcon />
            </Box>
          </Box>
          <Box>
            <Image
              src={backendUrl + logoPath}
              alt="Logo"
              width={50}
              height={50}
            />
          </Box>
          <Box className="flex gap-5">            
            <Box onClick={openOrderHistory} sx={{ cursor: "pointer" }}>
              {orderCount > 0 ? (
                <Badge badgeContent={orderCount} color="error">
                  <HistoryIcon />
                </Badge>
              ) : (
                <HistoryIcon />
              )}
            </Box>
            <Box onClick={openCart} sx={{ cursor: "pointer" }}>
              {cartCount > 0 ? (
                <Badge badgeContent={cartCount} color="error">
                  <AddShoppingCartIcon />
                </Badge>
              ) : (
                <AddShoppingCartIcon />
              )}
            </Box>
          </Box>
        </Box>
        {/* Parent categories navigation */}
        <Box className="flex items-center justify-between w-full !bg-white">
          <Box className="flex-grow ml-4 mr-4 overflow-x-auto whitespace-nowrap">
            <Swiper spaceBetween={10} slidesPerView="auto">
              {categories.map((category) => (
                <SwiperSlide
                  key={category.category_id}
                  style={{ width: "auto" }}
                >
                  <Typography
                    variant="body1"
                    className={
                      "cursor-pointer py-1 px-3 !text-xs " +
                      (parentCategory.category_id === category.category_id
                        ? "!text-[#DB0007] border-b-4 border-[#DB0007]"
                        : "!text-black")
                    }
                    onClick={() => handleClickParentCategory(category)}
                  >
                    {currentLocale === "ja"
                      ? category.category_name
                      : category["category_" + currentLocale + "_name"]}
                  </Typography>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        </Box>

        {/* Child categories navigation */}
        {parentCategory.children && parentCategory.children.length > 0 && (
          <Box className="!px-5 overflow-x-auto whitespace-nowrap !bg-white">
            <Swiper spaceBetween={10} slidesPerView="auto" className="!mt-0 !pb-2">
              {parentCategory.children.map((category, index) => (
                <SwiperSlide
                  key={category.category_id}
                  style={{ width: "auto" }}
                >
                  <Typography
                    variant="body1"
                    className={
                      "cursor-pointer py-1 px-3 !text-xs " +
                      (childCategory.category_id === category.category_id
                        ? "!text-[#DB0007] border-b-4 border-[#DB0007]"
                        : "!text-black")
                    }
                    onClick={() => handleClickChildCategory(category, index)}
                  >
                    {currentLocale === "ja"
                      ? category.category_name
                      : category["category_" + currentLocale + "_name"]}
                  </Typography>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        )}
      </Box>

      {/* Dishes swiper */}
      <Box className="w-full overflow-hidden !bg-[#f7f7f7] min-h-[calc(100vh-97px)]">
        {parentCategory.children && parentCategory.children.length > 0 ? (
          <Swiper
            spaceBetween={10}
            slidesPerView={1} // <-- full width slides
            className="!mt-3 !pb-2"
            onSwiper={(swiper) => (childSwiperRef.current = swiper)}
            autoHeight={true}
            onSlideChangeTransitionEnd={(swiper) => {
              const index = swiper.activeIndex;
              const category = parentCategory.children[index];
              if (category) {
                setChildIndex(index);
                setChildCategory(category);
                setDishes(category.dishes);
              }
            }}
            initialSlide={childIndex}
            style={{ width: "calc(100vw - 20px)" }} // make sure swiper takes full viewport width
          >
            {parentCategory.children.map((category) => (
              <SwiperSlide key={category.category_id}>
                {category.dishes.length > 0 ? (
                  <Grid container spacing={2}>
                    {category.dishes.map((dish) => (
                      <Grid size={{ xs: 6, sm: 6, md: 3 }} key={dish.dish_id}>
                        <DishCard
                          dish={dish}
                          currentLocale={currentLocale}
                          openDish={openDish}
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box
                    sx={{
                      height: 500, // some min height to make slide visible and draggable
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#888",
                    }}
                  >
                    {t("no_dishes_available")}
                  </Box>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          // If no children, just show dishes of parentCategory
          <Grid container spacing={2} className="py-2 px-2">
            {dishes.map((dish) => (
              <Grid size={{ xs: 6, sm: 6, md: 3 }} key={dish.dish_id}>
                <DishCard
                  dish={dish}
                  currentLocale={currentLocale}
                  openDish={openDish}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}
