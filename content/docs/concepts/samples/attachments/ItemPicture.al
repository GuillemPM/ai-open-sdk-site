OpenAI: Codeunit "AIOS OpenAI";
Client: Codeunit "AIOS Client";
Request: Record "AIOS Chat Request";
Result: Codeunit "AIOS Generate Result";
Item: Record Item;
ApiKey: SecretText;
begin
    Item.Get('1000');
    if Item.Picture.Count() = 0 then
        Error('Item %1 has no picture.', Item."No.");

    Request.SetSystemMessage('You write product copy for Business Central item cards.');
    Request.SetPrompt('Write a two-sentence webshop description for this item image.');
    Request.Attach(Item.Picture.Item(1));

    Result := Client.GenerateText(OpenAI.Model('gpt-5.6-sol', ApiKey), Request);
end;
