OpenAI: Codeunit "AIOS OpenAI";
Client: Codeunit "AIOS Client";
Result: Codeunit "AIOS Generate Result";
ApiKey: SecretText;
begin
    Result := Client.GenerateText(
        OpenAI.Model('gpt-4.1', ApiKey),
        'Hello');
    Message(Result.Output());
end;
