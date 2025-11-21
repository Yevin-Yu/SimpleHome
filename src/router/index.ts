import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/views/home/index.vue"),
    },
    {
      path: "/bookmarks",
      name: "bookmarks",
      component: () => import("@/views/bookmarks/index.vue"),
    },
  ],
});

export default router;
