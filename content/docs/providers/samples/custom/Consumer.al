MyProvider: Codeunit "My AIOS Provider";
Client: Codeunit "AIOS Client";
Result: Codeunit "AIOS Generate Result";
ApiKey: SecretText;
begin
    Result := Client.GenerateText(
        MyProvider.Model('my-model', ApiKey),
        Prompt);
end;
