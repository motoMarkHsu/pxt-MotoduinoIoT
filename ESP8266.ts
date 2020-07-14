/**
 * Custom blocks
 */
//% color=#00bc11 icon="\uf1eb" weight=90 block="MotoduinoIoT"
namespace MotoduinoWiFi {

    let bAP_Connected: boolean = false
    let bThingSpeak_Connected: boolean = false

    // write AT command with CR+LF ending
    function sendAT(command: string, wait: number = 1000) {
        serial.writeString(command + "\u000D\u000A")
        basic.pause(wait)
    }
	
    // wait for certain response from ESP8266
    function waitResponse(): boolean {
        let serial_str: string = ""
        let result: boolean = false
        let time: number = input.runningTime()
        while (true) {
            serial_str += serial.readString()
            if (serial_str.length > 200) {
                serial_str = serial_str.substr(serial_str.length - 200)
            }
            if (serial_str.indexOf("OK")>=0 || serial_str.indexOf("ALREADY CONNECTED")>=0) {
                result = true
                break
            } else if (serial_str.indexOf("ERROR")>=0 || serial_str.indexOf("SEND FAIL")>=0) {
                break
            }
            if (input.runningTime() - time > 5000) {
                break
            }
        }
        return result
    }

    /**
    * Set Motoduino WIFI Terminal 
    * @param txd Iot module to micro:bit ; eg: SerialPin.P15
    * @param rxd micro:bit to Iot module ; eg: SerialPin.P8
    */
    //% blockId=Wifi_Setup
    //% weight=100
    //% block="Motoduino WIFI Set| Tx_Pin %txd| Rx_Pin %rxd| SSID %ssid| PASSWORD %passwd"
    //% txd.defl=SerialPin.P13
    //% rxd.defl=SerialPin.P14
	//% ssid.defl="MarkHsu"
	//% passwd.defl="kh3109269"
	
    export function Wifi_Setup(txd: SerialPin, rxd: SerialPin, ssid: string, passwd: string): void {

        bAP_Connected = false
        bThingSpeak_Connected = false
		
        serial.redirect(txd, rxd, BaudRate.BaudRate9600)
        sendAT("AT+RST")
    	sendAT("AT+CWMODE_CUR=1")
    	sendAT("AT+CWJAP_CUR=\"" + ssid + "\",\"" + passwd + "\"", 0)
        bAP_Connected = waitResponse()
    	basic.pause(3000)
    }


    /**
    * Check if ESP8266 successfully connected to Wifi
    */
    //% blockId=Check_WiFiConnect
    //% weight=85
    //% block="Check WiFiConnect"
	
    export function Check_WiFiConnect(): boolean {
        return bAP_Connected
    }
	
	
    //% blockId=ThingSpeak_Uploader
    //% weight=80
    //% block="ThingSpeak Data Upload| Write API Keys %apikey| Field 1 %f1| Field 2 %f2| Field 3 %f3| Field 4 %f4| Field 5 %f5| Field 6 %f6| Field 7 %f7| Field 8 %f8"
    //% apikey.defl="P41FO62IC3SC9Y9Q"
	
    export function ThingSpeak_Uploader(apikey: string, f1: number, f2: number, f3: number, f4: number, f5: number, f6: number, f7: number, f8: number): void {
        sendAT("AT+CIPSTART=\"TCP\",\"api.thingspeak.com\",80", 3000)
        let TSCommand = "GET /update?key=" + apikey + "&field1=" + f1 + "&field2=" + f2 + "&field3=" + f3 + "&field4=" + f4 + "&field5=" + f5 + "&field6=" + f6 + "&field7=" + f7 + "&field8=" + f8
        let ATCommand = "AT+CIPSEND=" + (TSCommand.length + 2)
        sendAT(ATCommand)
        sendAT(TSCommand,3000)
        sendAT("AT+CIPCLOSE")
    }
	
	
    //% blockId=IFTTT_Service
    //% weight=70
    //% block="IFTTT Service| API Keys %apikey| Event Name %eventName| Value 1 %v1| Value 2 %v2| Value 3 %v3"
    //% apikey.defl="d2tCByRKOVoOzbHT-PAelo"
    //% eventName.defl="IFTTT_Trigger"
	
    export function IFTTT_Service(apikey: string, eventName: string, v1: number, v2: number, v3: number): void {
        let IFTTTParameter = "\r\n{\"value1\":\""+ v1+"\",\"value2\":\""+ v2+"\",\"value3\":\""+ v3+"\"}"
        let nCommandLen: number = IFTTTParameter.length + 2
        //let IFTTTCommand = "POST /trigger/"+ eventName+ "/with/key/"+ apikey+" HTTP/1.1\r\nHost: maker.ifttt.com\r\nUser-Agent: Arduino\r\nAccept: */*\r\nContent-Length: \r\n"+ nCommandLen+"\r\nContent-Type: application/json\r\nConnection: close\r\n{\"value1\":\""+ v1+"\",\"value2\":\""+ v2+"\",\"value3\":\""+ v3+"\"}"
        //let ATCommand = "AT+CIPSEND=" + (IFTTTCommand.length + 2)
		
        let IFTTTCommand2 = "GET /trigger/"+ eventName+ "/with/key/"+ apikey+ "?value1="+ v1+ "&value2="+ v2+"&value3="+ v3+ "\r\n\r\n\r\n\r\n"
        //let IFTTTCommand3 = "GET /trigger/"+ eventName+ "/with/key/"+ apikey+" HTTP/1.1\r\nHost: maker.ifttt.com\r\nConnection: close\r\n\r\n\r\n\r\n"
        let ATCommand = "AT+CIPSEND=" + (IFTTTCommand2.length + 2)
		
        sendAT("AT+CIPSTART=\"TCP\",\"maker.ifttt.com\",80", 3000)
        sendAT(ATCommand)
        sendAT(IFTTTCommand2,3000)
        //sendAT(IFTTTParameter,3000)
        sendAT("AT+CIPCLOSE")
    }
}
