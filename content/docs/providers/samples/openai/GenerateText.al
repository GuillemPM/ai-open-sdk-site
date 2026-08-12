OpenAI: Codeunit "AIOS OpenAI";
Client: Codeunit "AIOS Client";
Result: Codeunit "AIOS Generate Result";
ApiKey: SecretText;
begin
    Result := Client.GenerateText(
        OpenAI.Model('gpt-5.6-sol', ApiKey),
        'Hello');
    Message(Result.Output());
end;
