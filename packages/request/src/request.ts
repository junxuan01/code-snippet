export class Request {
  private baseUrl: string;
  constructor({ baseUrl }: { baseUrl: string }) {
    this.baseUrl = baseUrl;
    console.log("Request");
  }
}
