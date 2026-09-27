Compatible: Codeunit "AIOS OpenAI Compatible";
Client: Codeunit "AIOS Client";
Result: Codeunit "AIOS Generate Result";
ApiKey: SecretText;
begin
    Result := Client.GenerateText(
        Compatible.Model('llama-3.3-70b', ApiKey, 'https://api.example.com/v1'),
        'Summarize this warehouse shipment');
    Message(Result.Output());
end;
