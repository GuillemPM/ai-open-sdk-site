[Test]
procedure Summary_ShowsFallback_WhenProviderRejectsKey()
var
    Mock: Codeunit "AIOS Mock";
    Client: Codeunit "AIOS Client";
begin
    Mock.SetNextError("AIOS Error Type"::AuthenticationFailed, 'invalid api key');

    asserterror Client.GenerateText(Mock.Model('mock-model'), 'Summarize this note');

    if StrPos(GetLastErrorText(), 'invalid api key') = 0 then
        Error('Unexpected error: %1', GetLastErrorText());
end;
