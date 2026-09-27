Mock: Codeunit "AIOS Mock";
Client: Codeunit "AIOS Client";
Request: Record "AIOS Chat Request";
Base64Convert: Codeunit "Base64 Convert";
Result: Codeunit "AIOS Generate Result";
begin
    Mock.SetNextResponse('Summary: short note about shipping.');
    Request.SetPrompt('Summarize the attached note.');
    Request.Attach(Base64Convert.ToBase64('Ship by Friday. PO-1042.'), 'text/plain', 'note.txt');

    Result := Client.GenerateText(Mock.Model('mock-model'), Request);
end;
