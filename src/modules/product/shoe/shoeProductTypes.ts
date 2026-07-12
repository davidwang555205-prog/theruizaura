export type TeamShoe =
  | "Cloud Dancer 云舞者"
  | "Sand Dollar 沙钱白"
  | "Cappuccino 卡布奇诺"
  | "Silver Romance 银色浪漫"
  | "Aire 微风"
  | "Delphinium Blue 飞燕草蓝"
  | "Lemon 柠檬"
  | "Maple Grove 枫林"
  | "Oreo 奥利奥"
  | "Panda 熊猫"
  | "自定义";

export type ShoeProductContext = {
  mode: "shoe";
  shoe: TeamShoe;
  customShoe: string;
};
