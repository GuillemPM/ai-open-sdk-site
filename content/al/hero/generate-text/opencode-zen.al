Zen: Codeunit "AIOS OpenCode Zen";
Client: Codeunit "AIOS Client";
Result: Codeunit "AIOS Generate Result";
ApiKey: SecretText;
begin
    Result := Client.GenerateText(
        Zen.Model('big-pickle', ApiKey),
        'Hello from Business Central');
    Message(Result.Output());
end;
