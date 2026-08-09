MyProvider: Codeunit "My LLM Provider";
Client: Codeunit "AIOS Client";
Result: Codeunit "AIOS Generate Result";
ApiKey: SecretText;
begin
    // Implement "AIOS Language Model" (and optionally "AIOS Provider")
    Result := Client.GenerateText(
        MyProvider.Model('my-model', ApiKey),
        'Hello');
    Message(Result.Output());
end;
