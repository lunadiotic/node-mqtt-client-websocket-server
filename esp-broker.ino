#include <ESP8266WiFi.h>
#include <MQTT.h>

const char* ssid = "";
const char* password = "";
const char* mqtt_server = "broker.emqx.io";

const char* potensio_topic = "potensio-result";

WiFiClient espClient;
MQTTClient client;

int potValue = 0;
int prevPotValue = 0;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  client.begin(mqtt_server, 1883, espClient);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }

  client.loop();

  // Baca nilai potensiometer
  potValue = analogRead(A0);

  // Jika nilai potensiometer berubah, lakukan publish ke topik
  if (potValue != prevPotValue) {
    char potValueStr[4];
    Serial.println(potValueStr);
    sprintf(potValueStr, "%d", potValue);
    client.publish(potensio_topic, potValueStr);
    prevPotValue = potValue;
  }

  delay(1000); // Ubah nilai delay sesuai kebutuhan Anda
}

void reconnect() {
  while (!client.connected()) {
    Serial.println("Connecting to MQTT...");
    if (client.connect("ArduinoClient")) {
      Serial.println("Connected to MQTT");
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.lastError());
      Serial.println(" Try again in 5 seconds");
      delay(5000);
    }
  }
}


