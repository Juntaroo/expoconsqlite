import React from "react";
import { View } from "react-native";
import { Button, Menu } from "react-native-paper";

type Props = {
  value: "LOW" | "MEDIUM" | "HIGH";
  onChange: (v: "LOW" | "MEDIUM" | "HIGH") => void;
};

export default function SeverityPicker({ value, onChange }: Props) {
  const [visible, setVisible] = React.useState(false);

  const labels: Record<"LOW" | "MEDIUM" | "HIGH", string> = {
    LOW: "🟢 Baja",
    MEDIUM: "🟡 Media",
    HIGH: "🔴 Alta",
  };

  return (
    <View>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setVisible(true)}
            icon="alert"
          >
            {labels[value]}
          </Button>
        }
      >
        <Menu.Item
          onPress={() => {
            onChange("LOW");
            setVisible(false);
          }}
          title="🟢 Low - Baja"
        />
        <Menu.Item
          onPress={() => {
            onChange("MEDIUM");
            setVisible(false);
          }}
          title="🟡 Medium - Media"
        />
        <Menu.Item
          onPress={() => {
            onChange("HIGH");
            setVisible(false);
          }}
          title="🔴 High - Alta"
        />
      </Menu>
    </View>
  );
}
