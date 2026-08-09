Mock: Codeunit "AIOS Mock";
Client: Codeunit "AIOS Client";
Result: Codeunit "AIOS Generate Result";
begin
    Mock.SetNextResponse('Hello from mock');
    Result := Client.GenerateText(Mock.Model('mock-model'), 'Hello');
end;
