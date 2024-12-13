/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView } from 'react-native';

// import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';
import { cn } from "@/lib/cn";

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];

// export function useThemeColor(
//   props: { light?: string; dark?: string },
//   colorName: keyof typeof Colors.light & keyof typeof Colors.dark
// ) {
//   const theme = useColorScheme() ?? "light";
//   const colorFromProps = props[theme];

//   if (colorFromProps) {
//     return colorFromProps;
//   } else {
//     return Colors[theme][colorName];
//   }
// }

export function Text(props: TextProps) {
  const { lightColor, darkColor, className, ...otherProps } = props;
  // const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <DefaultText className={cn("text-foreground", className)} {...otherProps} />
  );
}

export function View(props: ViewProps) {
  const { lightColor, darkColor, className, ...otherProps } = props;
  // const backgroundColor = useThemeColor(
  //   { light: lightColor, dark: darkColor },
  //   "background"
  // );
  return (
    <DefaultView
      className={cn(className)}
      // style={[{ backgroundColor }, style]}
      {...otherProps}
    />
  );
}
