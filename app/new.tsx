import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { Button } from "react-native-paper";
import { upsertObservation } from "../src/domain/repo";
import SeverityPicker from "../src/ui/SeverityPicker";

export default function NewScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<"LOW" | "MEDIUM" | "HIGH">("LOW");
  const [description, setDescription] = useState("");

  async function handleSave() {
    await upsertObservation({ title, severity, description });
    router.back();
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontWeight: "bold" }}>Título</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Título"
        style={{ borderWidth: 1, borderRadius: 8, padding: 8 }}
      />

      <Text style={{ fontWeight: "bold" }}>Severidad</Text>
      <SeverityPicker value={severity} onChange={setSeverity} />

      <Text style={{ fontWeight: "bold" }}>Descripción</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Descripción"
        multiline
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 8,
          height: 100,
          textAlignVertical: "top",
        }}
      />

      <Button
  mode="contained"
  icon="content-save"
  onPress={handleSave}
  style={{ marginTop: 12, borderRadius: 10, paddingVertical: 4 }}
  labelStyle={{ fontSize: 16, fontWeight: "600" }}
>
  Guardar
</Button>
    </View>
  );
}
