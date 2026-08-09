DeepSeek: Codeunit "AIOS DeepSeek";
Client: Codeunit "AIOS Client";
Result: Codeunit "AIOS Generate Result";
ApiKey: SecretText;
begin
    Result := Client.GenerateText(
        DeepSeek.Model('deepseek-v4-pro', ApiKey),
        'Classify this vendor invoice line');
    Message(Result.Output());
end;
