# frozen_string_literal: true

# AEO 데이터 병합 플러그인
#
# _data/aeo/<포스트 파일명(확장자 제외)>.yml 의 값(summary, faq, keywords, tested_on, description)을
# 빌드 시 해당 포스트의 front matter 에 병합한다.
#
# - 포스트 파일을 수정하지 않으므로 git 기반 수정일(jekyll-last-modified-at)이 바뀌지 않는다.
# - 포스트 front matter 에 같은 키가 이미 값이 있으면 front matter 가 우선한다.
#   (빈 문자열/공백만 있는 값은 "없음"으로 보고 데이터 파일 값으로 채운다)
# - 새 글은 front matter 에 직접 써도 되고, _data/aeo/ 에 파일을 만들어도 된다.
Jekyll::Hooks.register :site, :post_read do |site|
  aeo = site.data['aeo'] || {}
  matched = {}

  site.posts.docs.each do |post|
    key = File.basename(post.path, File.extname(post.path))
    data = aeo[key]
    next unless data.is_a?(Hash)

    matched[key] = true
    data.each do |field, value|
      current = post.data[field]
      blank = current.nil? || (current.is_a?(String) && current.strip.empty?)
      post.data[field] = value if blank
    end
  end

  (aeo.keys - matched.keys).each do |orphan|
    Jekyll.logger.warn 'AEO data:', "_data/aeo/#{orphan}.yml 에 해당하는 포스트가 없습니다"
  end
end
