Gemini: Codeunit "AIOS Gemini";
Client: Codeunit "AIOS Client";
Result: Codeunit "AIOS Generate Result";
ApiKey: SecretText;
begin
    Result := Client.GenerateText(
        Gemini.Model('gemini-3.5-flash', ApiKey),
        'Summarize this warehouse shipment');
    Message(Result.Output());
end;
