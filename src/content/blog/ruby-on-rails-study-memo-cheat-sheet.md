---
title: "Ruby on Rails 学習メモ的チートシート"
date: "2018-04-11T17:14:06+09:00"
category: "Development"
tags: ["Ruby", "Rails"]
---

> この記事はQiitaに書いていた自身の記事のコピーです。

なるほどと思ったことや、メモとして残したいことをじわじわ残していってるので、少しずつ内容は変化してます。あしからず。

<!-- more -->

---

## 主な参考

- [Ruby on Rails 5入門 (全28回) - プログラミングならドットインストール](https://dotinstall.com/lessons/basic_rails_v3)
- [Ruby on Rails 5 の上手な使い方](https://amzn.to/2Jewn9Y)

## START

```shell title="各種環境が導入されていることを確認"
ruby -v
sqlite3 --version
rails --version
```

```shell title="プロジェクト作成"
rails new <プロジェクト名>
# カレントディレクトリ/<プロジェクト名> にファイルが生成される
```

↑だと、正直いらない`coffee script`とかまで自動導入されてしまうので、

```shell title="プロジェクト作成：bandleスキップ"
rails new <プロジェクト名> -B
# カレントディレクトリ/<プロジェクト名> にファイルが生成される
```

でファイル生成だけ行い、Gemfileを編集する。

### .sassファイルを生成するようにする

```ruby title="config/application.rbに追記"
config.sass.preferred_syntax = :sass
```

### Gem 周り

Gemfile: Node.js環境で言うところのpackage.json内依存モジュール一覧と似たようなもの。

```ruby title="CoffeeScript無効化（コメントアウトのみ）"
# gem 'coffee-rails', '~> 4.2'
```

```ruby title="Haml導入"
gem 'hamlit-rails'
# いろいろ種類があるがこれが一番高速らしい
# Slimも魅力的であるが、slim-railsより高速らしいのでこちらを選択。
gem 'erb2haml'
```

```ruby title="Debug環境強化"
group :development do
  # 追記
  # better errors
  gem 'better_errors'
  gem 'binding_of_caller'
end
# step by step debug
gem 'pry-byebug'
```

```ruby title="開発補助系gem"
group :development do
  # 追記
  # モデルファイルの情報追加
  gem 'annotate'
end
```

## フォルダ構成

### 実際に操作するもの

- app: メイン
- config: 設定
- db: データベース

### appフォルダ

#### MVC設計

- models
- views
- controllers

#### 他に使うもの

- assets: 画像やJS,CSSをいれる

## Model

```shell title="ファイル生成"
rails g model Name sub:string sub:text...
# Name: モデル名、単数かつ頭大文字がよし
# sub: 各パラメータ

# created_atとupdated_atは自動で生成される
```

```shell title="DB生成"
rails db:migrate
```

```shell title="DBを全削除"
rails db:migrate:reset
```

### 初期データ定義

`db/seeds.rb`をいじる。
rubyを直接書ける。

```ruby title="4つの初期データを生成する場合"
5.times do |i|
  Name.create(title: 'title #{i}', body: 'body #{i}')
end
```

```shell title="seedから初期データ生成"
rails db:seed
```

### 詳細定義

`app/models/name.rb`をいじる。

```ruby title="Validation"
validates :sub, presence: true, length: { minimum: 3 }
# presence: true > 入力必須
```

これを定義した場合、サーバーサイドValidationでErrorが出た場合のController/Viewを定義する必要があるので留意（[参考](https://dotinstall.com/lessons/basic_rails_v3/41817)）。

```ruby title="別のModelとの紐付け"
has_many :name2s, dependent: destroy
```

## Controller

ModelとViewをつなぐ役割。Modelを基準に生成する。

```shell title="ファイル生成"
rails g controller Names
# app/controllers/names_controller.rbが生成
```

### routing

=URLとControllerの紐付け。

`config/routes.rb`を編集する。

```ruby title="Modelについて自動生成"
resources :names
```

```ruby title="別Modelに紐付けたModelについて自動生成"
resources :names do
  resources :name2s
end
```

```ruby title="一部のroutingのみを自動生成"
resources :names, only: [:create, :destroy]
```

```ruby title="一部のrouting以外を自動生成"
resources :names, except: [:create, :destroy]
```

```ruby title="root(/)指定"
root 'names#view名'
```

```shell title="全Routing確認"
rails routes

# これを基準に関数を作ったりPrefixを使ったりできる
```

### ファイル編集例

```ruby title="一覧取得"
def index
  @names = Name.all.order(created_at: 'desc')
end
```

```ruby title="Requestパラメータの利用"
# GETやPOSTで呼ばれた際に使える（routesで確認）
def show
  @name = Name.find(params[:id])
end
```

`all.order`や`find`は**Active Record**を参照。

```ruby title="Modelの追加保存（フォームから呼び出す形式で）"
def create
# @name = Name.new(param.[:name])では「厳密な引数指定をしていない」=「悪意のあるリクエストを受け付けてしまうおそれがある」というエラーが出る
  @name = Name.new(param.require(:name).permit(:sub1, :sub2))
  @name.save

  redirect_to names_path
end
```

```ruby title="Controller内の関数"
def create
  @name = Name.new(name_params)
  @name.save

  redirect_to names_path
end

private
  def name_params
    param.require(:name).permit(:sub1, :sub2))
end
```

```ruby title="404を返す"
render :status => 404
```

## View

### 全体管理

`app/views/layouts/application.html.erb`を参照。

railsで生成された要素は`<%= yield =>`部に入る。

#### CSS

`app/assets/stylecheets/application.css`を参照。

### 新規作成

Model-Controllerに紐付けて作る。
`app/views/names/`に`関数名.html.erb`を作成。

#### erb記法

```erb title="ruby式を埋め込む"
<% %>
```

```erb title="ruby式を埋め込み、評価結果をエスケープして埋め込む"
<%= %>
```

### ファイル編集例(erb)

```erb title="一覧表示"
<h2>一覧</h2>
<ul>
  <% @names.each do |post| %>
  <li><%= name.title %></li>
  <% end %>
</ul>
```

変数`@names`などは、controllerで指定したものをそのまま呼び出せる。

#### ファイル分割

```erb title="_hello.html.erb"
<!-- 正式名称：Partial -->
<p>hello</p>
```

```erb title="index.html.erb"
<%= render 'hello' %>
```

### ヘルパー

関数的動きをする決まった書き方。

```erb title="link_to"
<h2>一覧</h2>
<ul>
  <% @names.each do |post| %>
  <li>
  <%= link_to '表示する文字列', Link_URL %>
  </li>
  <% end %>
</ul>
```

```erb title="routesのPrefixの利用"
<%= link_to '表示する文字列', Prefix_path %>
```

```erb title="IDパラメータを渡す"
<%= link_to '表示する文字列', Prefix_path(name.id) %>
```

```erb title="IDパラメータを渡す(省略形)"
<%= link_to '表示する文字列', Prefix_path(name) %>
```

```erb title="methodの指定（Deleteなどに使う）"
<%= link_to '表示する文字列', Prefix_path(name), method: :method %>
```

```erb title="確認ダイアログを表示"
<%= link_to '表示する文字列', Prefix_path(name), method: :method, data: { cinfirm: '確認？' }%>
```

```erb title="改行で可視化できる"
<%= link_to '表示する文字列',
    Prefix_path(name),
    method: :method,
    data: { cinfirm: '確認？' }%>
```

```erb title="image_tag"
<!-- app/assets/images/ にファイルを設置 -->
<!-- ヘルパーは()で設定を囲める -->
<%= image_tag('ファイル名.png', class:className) %>
```

```erb title="form_for"
<%= form_for :name, url: names_path do |f| %>
<p>
  <%= f.text_field :sub, placeholder: 'enter sub' %>
  <%= f.text_area :sub, placeholder: 'enter sub' %>
  <%= f.submit %>
</p>
```

```erb title="simple_format"
<p><%= simple_format @name.sub %></p>
<!-- 改行を適切なタグに変えてくれる -->
```

## rails console

直接データベースを弄ったりできる：ActiveRecord。

```shell title="入る"
rails c
```

```shell title="モデルにデータを追加"
Name.create(title: 'title 2', body: 'body 2')
```

```shell title="モデルにデータを追加（一旦定義）"
# 定義
n = Name.new(title: 'title 1', body: 'body 1')
# 書き込み
n.save
```

```shell title="モデルのデータを確認"
Name.all
```

## rails dbconsole

railsで管理するデータベースのCUIを操作する。
データを見ながら編集するときなどに使う。
SQLで操作できる。

```shell title="入る"
rails db
```

```shell title="テーブル一覧取得"
.tables
```

Modelのテーブルは`names`のように小文字＋複数形になっている。

```shell title="特定のテーブルのデータ一覧取得"
select * from names;
# シンプルなSQL文
```

```shell
.quit
```

## session, cookies

```ruby title="設定"
session[:name] = a
cookies[:name] = a
```

```ruby title="存在確認"
if session[:name]
if cookies[:name]
```

## その他用語等

### CoC

細かいファイル配置などが決まっているからこそ書くコードが少なくて済むという思想・規約。

### Active Record

Railsで開発されているSQLみたいなやつ。ドットインストール有料。
